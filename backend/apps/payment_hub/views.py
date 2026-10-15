from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsAdminUser
from apps.payment_hub.authentication import ApplicationCredentialAuthentication, IsRegisteredApplication
from apps.payment_hub.bootstrap import bootstrap_registry
from apps.payment_hub.models import ApplicationCredential, HubTransaction, PaymentApplication, ProviderProfile
from apps.payment_hub.serializers import PaymentApplicationSerializer, ProviderProfileSerializer
from apps.payment_hub.services import (
    HubError,
    cancel_payment,
    create_payment,
    get_transaction,
    inquire_status,
    process_callback,
    public_payment,
    refresh_status,
)


class PaymentCollectionView(APIView):
    authentication_classes = [ApplicationCredentialAuthentication]
    permission_classes = [IsRegisteredApplication]

    def post(self, request):
        idempotency_key = request.headers.get('Idempotency-Key') or request.data.get('idempotency_key')
        try:
            txn = create_payment(request.auth, request.data, idempotency_key=idempotency_key or None)
        except HubError as exc:
            return Response({'error': exc.message}, status=exc.status)
        return Response(public_payment(txn), status=status.HTTP_201_CREATED)


class PaymentDetailView(APIView):
    authentication_classes = [ApplicationCredentialAuthentication]
    permission_classes = [IsRegisteredApplication]

    def get(self, request, internal_id):
        try:
            txn = get_transaction(request.auth, internal_id)
            txn = refresh_status(txn)
        except HubError as exc:
            return Response({'error': exc.message}, status=exc.status)
        return Response(public_payment(txn))


class PaymentStatusCheckView(APIView):
    """The owning application asks Toucan for one stored payment."""

    authentication_classes = [ApplicationCredentialAuthentication]
    permission_classes = [IsRegisteredApplication]

    def post(self, request):
        invoice = str(request.data.get('invoice') or '').strip()
        order_id = str(request.data.get('application_order_id') or '').strip()
        if not invoice and not order_id:
            return Response({'error': 'invoice or application_order_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        rows = HubTransaction.objects.filter(payment_application=request.auth).select_related(
            'payment_application', 'payment_application__provider_profile'
        )
        txn = rows.filter(toucan_invoice=invoice).first() if invoice else None
        if txn is None and order_id:
            txn = rows.filter(application_order_id=order_id).order_by('-id').first()
        if txn is None:
            return Response({'error': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            txn, message = inquire_status(txn)
        except HubError as exc:
            return Response({'error': exc.message}, status=exc.status)
        data = public_payment(txn)
        data['action_code'] = str((txn.provider_metadata or {}).get('actionCode') or '')
        data['message'] = message
        return Response(data)


class PaymentCancelView(APIView):
    authentication_classes = [ApplicationCredentialAuthentication]
    permission_classes = [IsRegisteredApplication]

    def post(self, request, internal_id):
        try:
            txn = cancel_payment(request.auth, internal_id)
        except HubError as exc:
            return Response({'error': exc.message}, status=exc.status)
        return Response(public_payment(txn))


class HubCallbackView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        result = process_callback(
            request.data,
            remote_addr=request.META.get('REMOTE_ADDR', ''),
            forwarded_for=request.META.get('HTTP_X_FORWARDED_FOR', ''),
        )
        code = status.HTTP_200_OK if result.get('suceess') else status.HTTP_403_FORBIDDEN
        return Response(result, status=code)


class ApplicationListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        bootstrap_registry()
        rows = PaymentApplication.objects.select_related('provider_profile').prefetch_related('credentials')
        return Response(PaymentApplicationSerializer(rows, many=True).data)

    def post(self, request):
        serializer = PaymentApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        credential = ApplicationCredential.issue(application)
        data = PaymentApplicationSerializer(application).data
        data['apiKey'] = credential.plaintext_api_key
        data['hmacSecret'] = credential.plaintext_hmac_secret
        return Response(data, status=status.HTTP_201_CREATED)


class ApplicationDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        application = PaymentApplication.objects.filter(pk=pk).first()
        if application is None:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PaymentApplicationSerializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PaymentApplicationSerializer(application).data)


class RotateCredentialView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        application = PaymentApplication.objects.filter(pk=pk).first()
        if application is None:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)
        credential = ApplicationCredential.issue(application)
        return Response({
            'applicationId': application.application_id,
            'apiKey': credential.plaintext_api_key,
            'hmacSecret': credential.plaintext_hmac_secret,
            'keyPrefix': credential.key_prefix,
        })


class ProviderProfileListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        bootstrap_registry()
        return Response(ProviderProfileSerializer(ProviderProfile.objects.all(), many=True).data)

    def post(self, request):
        serializer = ProviderProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(ProviderProfileSerializer(serializer.save()).data, status=status.HTTP_201_CREATED)


class ProviderProfileDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        profile = ProviderProfile.objects.filter(pk=pk).first()
        if profile is None:
            return Response({'error': 'Provider profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProviderProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ProviderProfileSerializer(profile).data)

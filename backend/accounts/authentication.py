from rest_framework import exceptions
from rest_framework.authentication import TokenAuthentication, get_authorization_header


class BearerOrTokenAuthentication(TokenAuthentication):
    """
    Custom TokenAuthentication supporting both:
    - Authorization: Token <key>
    - Authorization: Bearer <key>
    This allows seamless integration with frontends sending Bearer tokens.
    """

    def authenticate(self, request):
        auth = get_authorization_header(request).split()

        if not auth or auth[0].lower() not in (b"bearer", b"token"):
            return None

        if len(auth) == 1:
            msg = "Invalid token header. No credentials provided."
            raise exceptions.AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = "Invalid token header. Token string should not contain spaces."
            raise exceptions.AuthenticationFailed(msg)

        try:
            token = auth[1].decode()
        except UnicodeError:
            msg = "Invalid token header. Token string should not contain invalid characters."
            raise exceptions.AuthenticationFailed(msg)

        return self.authenticate_credentials(token)

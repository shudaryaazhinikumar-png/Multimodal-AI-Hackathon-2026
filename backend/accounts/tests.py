from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import StudentProfile


class SignupTests(APITestCase):
    """
    Tests for POST /api/auth/signup
    """

    def setUp(self):
        self.signup_url = "/api/auth/signup"
        self.valid_payload = {
            "name": "Ada Lovelace",
            "email": "ada@example.com",
            "password": "SecurePassword123!",
            "learningGoal": "Master Machine Learning",
            "education": "B.S. Computer Science",
        }

    def test_successful_signup(self):
        # 1. successful signup
        response = self.client.post(self.signup_url, self.valid_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["email"], "ada@example.com")
        self.assertEqual(response.data["name"], "Ada Lovelace")

    def test_signup_creates_user(self):
        # 2. signup creates User
        self.client.post(self.signup_url, self.valid_payload, format="json")
        user = User.objects.filter(email="ada@example.com").first()
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, "Ada")
        self.assertEqual(user.last_name, "Lovelace")
        self.assertEqual(user.username, "ada@example.com")

    def test_signup_creates_student_profile(self):
        # 3. signup creates StudentProfile
        self.client.post(self.signup_url, self.valid_payload, format="json")
        user = User.objects.get(email="ada@example.com")
        profile = StudentProfile.objects.filter(user=user).first()
        self.assertIsNotNone(profile)
        self.assertEqual(profile.learning_goal, "Master Machine Learning")
        self.assertEqual(profile.education, "B.S. Computer Science")

    def test_signup_creates_token(self):
        # 4. signup creates Token
        response = self.client.post(self.signup_url, self.valid_payload, format="json")
        user = User.objects.get(email="ada@example.com")
        token = Token.objects.filter(user=user).first()
        self.assertIsNotNone(token)
        self.assertEqual(response.data["token"], token.key)

    def test_signup_response_contains_expected_fields(self):
        # 5. response contains expected fields
        response = self.client.post(self.signup_url, self.valid_payload, format="json")
        expected_fields = [
            "token",
            "id",
            "name",
            "email",
            "education",
            "learningGoal",
            "joinedDate",
            "avatar",
        ]
        for field in expected_fields:
            self.assertIn(field, response.data)
        self.assertTrue(response.data["id"].startswith("stu-"))
        self.assertEqual(response.data["avatar"], "AL")

    def test_signup_password_is_hashed(self):
        # 6. password is hashed
        self.client.post(self.signup_url, self.valid_payload, format="json")
        user = User.objects.get(email="ada@example.com")
        self.assertNotEqual(user.password, "SecurePassword123!")
        self.assertTrue(user.check_password("SecurePassword123!"))

    def test_signup_duplicate_email_rejected(self):
        # 7. duplicate email rejected
        self.client.post(self.signup_url, self.valid_payload, format="json")
        duplicate_payload = {
            "name": "Another User",
            "email": "ADA@example.com",
            "password": "AnotherPassword123!",
        }
        response = self.client.post(self.signup_url, duplicate_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_signup_email_normalization(self):
        # 8. email normalization
        payload = {
            "name": "Grace Hopper",
            "email": "  GrAcE.hOpPeR@ExAmPlE.CoM  ",
            "password": "SecurePassword123!",
        }
        response = self.client.post(self.signup_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], "grace.hopper@example.com")
        user = User.objects.get(email="grace.hopper@example.com")
        self.assertEqual(user.username, "grace.hopper@example.com")

    def test_signup_invalid_email_rejected(self):
        # 9. invalid email rejected
        payload = {
            "name": "Invalid Email",
            "email": "not-a-valid-email",
            "password": "SecurePassword123!",
        }
        response = self.client.post(self.signup_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data["details"])

    def test_signup_missing_required_fields_rejected(self):
        # 10. missing required fields rejected
        # Missing name
        res1 = self.client.post(
            self.signup_url,
            {"email": "test@example.com", "password": "Password123!"},
            format="json",
        )
        self.assertEqual(res1.status_code, status.HTTP_400_BAD_REQUEST)

        # Missing email
        res2 = self.client.post(
            self.signup_url,
            {"name": "Test User", "password": "Password123!"},
            format="json",
        )
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)

        # Missing password
        res3 = self.client.post(
            self.signup_url,
            {"name": "Test User", "email": "test2@example.com"},
            format="json",
        )
        self.assertEqual(res3.status_code, status.HTTP_400_BAD_REQUEST)

    def test_signup_short_password_rejected(self):
        # 11. short password rejected (< 8 chars)
        payload = {
            "name": "Short Pass",
            "email": "short@example.com",
            "password": "short",
        }
        response = self.client.post(self.signup_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data["details"])

    def test_signup_blank_invalid_name_rejected(self):
        # 12. blank/invalid name rejected
        payload = {
            "name": "   ",
            "email": "blankname@example.com",
            "password": "SecurePassword123!",
        }
        response = self.client.post(self.signup_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data["details"])


class LoginTests(APITestCase):
    """
    Tests for POST /api/auth/login
    """

    def setUp(self):
        self.login_url = "/api/auth/login"
        self.email = "student@example.com"
        self.password = "MyStrongPassword123!"
        self.user = User.objects.create_user(
            username=self.email,
            email=self.email,
            password=self.password,
            first_name="Alan",
            last_name="Turing",
        )
        self.profile = StudentProfile.objects.create(
            user=self.user,
            education="PhD Mathematics",
            learning_goal="Cryptography & AI",
            avatar="",
        )

    def test_successful_login(self):
        # 13. successful login
        payload = {"email": self.email, "password": self.password}
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_response_contains_token(self):
        # 14. response contains token
        payload = {"email": self.email, "password": self.password}
        response = self.client.post(self.login_url, payload, format="json")
        self.assertIn("token", response.data)
        token = Token.objects.get(user=self.user)
        self.assertEqual(response.data["token"], token.key)

    def test_login_response_contains_student_data(self):
        # 15. response contains student data
        payload = {"email": self.email, "password": self.password}
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.data["id"], f"stu-{self.user.id}")
        self.assertEqual(response.data["name"], "Alan Turing")
        self.assertEqual(response.data["email"], self.email)
        self.assertEqual(response.data["education"], "PhD Mathematics")
        self.assertEqual(response.data["learningGoal"], "Cryptography & AI")
        self.assertEqual(response.data["avatar"], "AT")
        self.assertIn("joinedDate", response.data)

    def test_login_wrong_password_rejected(self):
        # 16. wrong password rejected
        payload = {"email": self.email, "password": "WrongPassword!"}
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data.get("error"), "Invalid email or password.")

    def test_login_nonexistent_email_rejected(self):
        # 17. nonexistent email rejected
        payload = {"email": "nobody@example.com", "password": self.password}
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data.get("error"), "Invalid email or password.")

    def test_login_missing_email_rejected(self):
        # 18. missing email rejected
        payload = {"password": self.password}
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_missing_password_rejected(self):
        # 19. missing password rejected
        payload = {"email": self.email}
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_email_normalization(self):
        # 20. email normalization
        payload = {"email": "  STUDENT@EXAMPLE.COM  ", "password": self.password}
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.email)

    def test_login_inactive_user_rejected(self):
        # 21. inactive user rejected
        self.user.is_active = False
        self.user.save()
        payload = {"email": self.email, "password": self.password}
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class LogoutTests(APITestCase):
    """
    Tests for POST /api/auth/logout
    """

    def setUp(self):
        self.logout_url = "/api/auth/logout"
        self.user = User.objects.create_user(
            username="logout_user@example.com",
            email="logout_user@example.com",
            password="Password123!",
            first_name="Logout",
            last_name="Tester",
        )
        self.profile = StudentProfile.objects.create(user=self.user)
        self.token = Token.objects.create(user=self.user)

    def test_authenticated_logout_succeeds(self):
        # 22. authenticated logout succeeds
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("message"), "Logged out successfully.")

    def test_logout_deletes_token(self):
        # 23. token is deleted/revoked
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        self.client.post(self.logout_url)
        self.assertFalse(Token.objects.filter(key=self.token.key).exists())

    def test_token_cannot_access_protected_endpoint_after_logout(self):
        # 24. token cannot access protected endpoint after logout
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        self.client.post(self.logout_url)

        # Attempt to access protected /api/auth/me with the revoked token
        response = self.client.get("/api/auth/me")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_logout_rejected(self):
        # 25. unauthenticated logout rejected
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_does_not_affect_other_user_tokens(self):
        # Ensure logout only revokes the active token and does not touch other users
        user2 = User.objects.create_user(
            username="other@example.com",
            email="other@example.com",
            password="Password123!",
        )
        token2 = Token.objects.create(user=user2)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        self.client.post(self.logout_url)

        # user2 token must still exist
        self.assertTrue(Token.objects.filter(key=token2.key).exists())


class MeEndpointTests(APITestCase):
    """
    Tests for GET /api/auth/me
    """

    def setUp(self):
        self.me_url = "/api/auth/me"
        self.user = User.objects.create_user(
            username="student_me@example.com",
            email="student_me@example.com",
            password="Password123!",
            first_name="Marie",
            last_name="Curie",
        )
        self.profile = StudentProfile.objects.create(
            user=self.user,
            education="PhD Physics & Chemistry",
            learning_goal="Radioactivity Research",
            avatar="",
        )
        self.token = Token.objects.create(user=self.user)

    def test_authenticated_me_succeeds(self):
        # 26. authenticated /me succeeds
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_me_returns_correct_user(self):
        # 27. /me returns correct user
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        response = self.client.get(self.me_url)
        self.assertEqual(response.data["id"], f"stu-{self.user.id}")
        self.assertEqual(response.data["name"], "Marie Curie")
        self.assertEqual(response.data["email"], "student_me@example.com")
        self.assertEqual(response.data["education"], "PhD Physics & Chemistry")
        self.assertEqual(response.data["learningGoal"], "Radioactivity Research")
        self.assertEqual(response.data["avatar"], "MC")

    def test_me_cannot_access_another_user_data(self):
        # 28. /me cannot access another user's data
        other_user = User.objects.create_user(
            username="other_me@example.com",
            email="other_me@example.com",
            password="Password123!",
            first_name="Albert",
            last_name="Einstein",
        )
        StudentProfile.objects.create(
            user=other_user,
            education="PhD Theoretical Physics",
            learning_goal="General Relativity",
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        response = self.client.get(self.me_url)
        self.assertEqual(response.data["email"], "student_me@example.com")
        self.assertNotEqual(response.data["name"], "Albert Einstein")

    def test_unauthenticated_me_rejected(self):
        # 29. unauthenticated /me rejected
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_bearer_authentication_works(self):
        # 30. Bearer authentication works
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_token_authentication_works(self):
        # 31. Token authentication works
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ProfileEndpointTests(APITestCase):
    """
    Tests for GET and PATCH /api/auth/profile
    """

    def setUp(self):
        self.profile_url = "/api/auth/profile"
        self.user = User.objects.create_user(
            username="profile_user@example.com",
            email="profile_user@example.com",
            password="Password123!",
            first_name="Nikola",
            last_name="Tesla",
        )
        self.profile = StudentProfile.objects.create(
            user=self.user,
            education="Electrical Engineering",
            learning_goal="AC Current & Motors",
            avatar="",
        )
        self.token = Token.objects.create(user=self.user)

    def test_authenticated_profile_get(self):
        # 32. authenticated profile GET
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Nikola Tesla")
        self.assertEqual(response.data["education"], "Electrical Engineering")
        self.assertEqual(response.data["learningGoal"], "AC Current & Motors")

    def test_unauthenticated_profile_get_rejected(self):
        # 33. unauthenticated profile GET rejected
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_successful_partial_update(self):
        # 34. successful partial update
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        response = self.client.patch(
            self.profile_url,
            {"learningGoal": "Wireless Power Transmission"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["learningGoal"], "Wireless Power Transmission")
        self.assertEqual(response.data["education"], "Electrical Engineering")

        self.profile.refresh_from_db()
        self.assertEqual(self.profile.learning_goal, "Wireless Power Transmission")
        self.assertEqual(self.profile.education, "Electrical Engineering")

    def test_update_learning_goal(self):
        # 35. update learningGoal
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        response = self.client.patch(
            self.profile_url,
            {"learningGoal": "Quantum Electrodynamics"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.learning_goal, "Quantum Electrodynamics")

    def test_update_education(self):
        # 36. update education
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        response = self.client.patch(
            self.profile_url,
            {"education": "MIT Master of Science"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.education, "MIT Master of Science")

    def test_update_avatar(self):
        # 37. update avatar
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        response = self.client.patch(
            self.profile_url,
            {"avatar": "⚡"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["avatar"], "⚡")
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.avatar, "⚡")

    def test_invalid_profile_data_rejected(self):
        # 38. invalid profile data rejected (> max length)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        response = self.client.patch(
            self.profile_url,
            {"avatar": "123456789012345"},  # max_length is 10
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("avatar", response.data["details"])

    def test_only_authenticated_user_profile_changes(self):
        # 39. only authenticated user's profile changes
        user2 = User.objects.create_user(
            username="other_profile@example.com",
            email="other_profile@example.com",
            password="Password123!",
            first_name="Thomas",
            last_name="Edison",
        )
        profile2 = StudentProfile.objects.create(
            user=user2,
            education="Self-taught",
            learning_goal="DC Electricity",
            avatar="TE",
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        self.client.patch(
            self.profile_url,
            {"learningGoal": "Radio & High Frequency"},
            format="json",
        )

        profile2.refresh_from_db()
        self.assertEqual(profile2.learning_goal, "DC Electricity")
        self.assertEqual(profile2.education, "Self-taught")

    def test_cannot_modify_protected_user_fields_through_profile(self):
        # 40. cannot modify protected User fields through profile endpoint
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        original_password_hash = self.user.password
        response = self.client.patch(
            self.profile_url,
            {
                "is_staff": True,
                "is_superuser": True,
                "email": "hacker@example.com",
                "id": "stu-9999",
                "password": "HackedPassword123!",
                "education": "Updated Education",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertFalse(self.user.is_staff)
        self.assertFalse(self.user.is_superuser)
        self.assertEqual(self.user.email, "profile_user@example.com")
        self.assertEqual(self.user.password, original_password_hash)
        self.assertEqual(self.user.id, self.user.id)


class SecurityAndAuthTests(APITestCase):
    """
    Tests for security, edge cases, and header handling
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="sec_user@example.com",
            email="sec_user@example.com",
            password="Password123!",
            first_name="Sec",
            last_name="User",
        )
        self.profile = StudentProfile.objects.create(user=self.user)
        self.token = Token.objects.create(user=self.user)

    def test_malformed_auth_header_missing_token(self):
        # 41. malformed auth header (no credentials)
        self.client.credentials(HTTP_AUTHORIZATION="Bearer")
        response = self.client.get("/api/auth/me")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_malformed_auth_header_too_many_parts(self):
        # 41. malformed auth header (too many parts / spaces)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key} extra")
        response = self.client.get("/api/auth/me")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_invalid_token(self):
        # 42. invalid token
        self.client.credentials(HTTP_AUTHORIZATION="Bearer invalidtoken1234567890")
        response = self.client.get("/api/auth/me")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_expired_deleted_token(self):
        # 43. expired/deleted/revoked token
        key = self.token.key
        self.token.delete()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {key}")
        response = self.client.get("/api/auth/me")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cross_user_access_attempts(self):
        # 44. cross-user access attempts
        victim = User.objects.create_user(
            username="victim@example.com",
            email="victim@example.com",
            password="Password123!",
            first_name="Victim",
            last_name="Student",
        )
        StudentProfile.objects.create(
            user=victim,
            learning_goal="Victim Goal",
            education="Victim Edu",
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        # Passing user ID in query param or body must not affect the result
        response = self.client.get(f"/api/auth/me?user_id={victim.id}")
        self.assertEqual(response.data["email"], "sec_user@example.com")
        self.assertNotEqual(response.data["name"], "Victim Student")

        patch_res = self.client.patch(
            f"/api/auth/profile?user_id={victim.id}",
            {"user_id": victim.id, "learningGoal": "Attacker New Goal"},
            format="json",
        )
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        victim.student_profile.refresh_from_db()
        self.assertEqual(victim.student_profile.learning_goal, "Victim Goal")

    def test_password_never_appears_in_responses(self):
        # 45. password never appears in responses
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")

        # Signup response
        signup_res = self.client.post(
            "/api/auth/signup",
            {
                "name": "No Password Leak",
                "email": "nopassleak@example.com",
                "password": "SuperSecretPassword123!",
            },
            format="json",
        )
        self.assertNotIn("password", signup_res.data)
        self.assertNotIn("SuperSecretPassword123!", str(signup_res.data))

        # Login response
        login_res = self.client.post(
            "/api/auth/login",
            {"email": "nopassleak@example.com", "password": "SuperSecretPassword123!"},
            format="json",
        )
        self.assertNotIn("password", login_res.data)
        self.assertNotIn("SuperSecretPassword123!", str(login_res.data))

        # Me response
        me_res = self.client.get("/api/auth/me")
        self.assertNotIn("password", me_res.data)

        # Profile GET response
        prof_get_res = self.client.get("/api/auth/profile")
        self.assertNotIn("password", prof_get_res.data)

        # Profile PATCH response
        prof_patch_res = self.client.patch(
            "/api/auth/profile",
            {"learningGoal": "Security First"},
            format="json",
        )
        self.assertNotIn("password", prof_patch_res.data)


class StudentSerializerUnitTests(APITestCase):
    """
    Direct unit tests for StudentSerializer helper logic.
    """

    def test_serializer_handles_user_without_student_profile(self):
        user_without_profile = User.objects.create_user(
            username="noprofile@example.com",
            email="noprofile@example.com",
            first_name="Jane",
            last_name="Doe",
        )
        from .serializers import StudentSerializer

        data = StudentSerializer(user_without_profile).data
        self.assertEqual(data["education"], "")
        self.assertEqual(data["learningGoal"], "")
        self.assertEqual(data["name"], "Jane Doe")
        self.assertEqual(data["avatar"], "JD")

    def test_serializer_avatar_initials_single_name(self):
        user = User.objects.create_user(
            username="singlename@example.com",
            email="singlename@example.com",
            first_name="Cher",
        )
        from .serializers import StudentSerializer

        data = StudentSerializer(user).data
        self.assertEqual(data["avatar"], "CH")

    def test_serializer_avatar_custom_override(self):
        user = User.objects.create_user(
            username="customavatar@example.com",
            email="customavatar@example.com",
            first_name="Ada",
            last_name="Lovelace",
        )
        StudentProfile.objects.create(
            user=user,
            avatar="🚀",
        )
        from .serializers import StudentSerializer

        data = StudentSerializer(user).data
        self.assertEqual(data["avatar"], "🚀")

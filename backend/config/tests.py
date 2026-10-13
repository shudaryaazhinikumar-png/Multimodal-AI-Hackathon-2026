from pathlib import Path
from unittest import TestCase

from django.core.exceptions import ImproperlyConfigured

from config.settings import configure_databases


class DatabaseConfigurationTests(TestCase):
    """
    Regression tests for development and production database configuration.
    """

    def setUp(self):
        self.base_dir = Path("/mock/base/dir")

    def test_development_defaults_to_sqlite(self):
        """When DEBUG=True and DATABASE_URL is empty, SQLite is used."""
        db_config = configure_databases(debug=True, database_url="", base_dir=self.base_dir)
        self.assertEqual(db_config["default"]["ENGINE"], "django.db.backends.sqlite3")
        self.assertEqual(db_config["default"]["NAME"], self.base_dir / "db.sqlite3")

    def test_production_fails_when_database_url_missing(self):
        """When DEBUG=False and DATABASE_URL is empty, ImproperlyConfigured is raised."""
        with self.assertRaises(ImproperlyConfigured) as ctx:
            configure_databases(debug=False, database_url="", base_dir=self.base_dir)
        self.assertIn("DATABASE_URL environment variable is required", str(ctx.exception))

    def test_invalid_scheme_raises_improperly_configured(self):
        """Unsupported URL scheme raises ImproperlyConfigured without exposing credentials."""
        secret_url = "mysql://admin:SuperSecretPass123!@db.example.com:3306/study_db"
        with self.assertRaises(ImproperlyConfigured) as ctx:
            configure_databases(debug=False, database_url=secret_url, base_dir=self.base_dir)
        msg = str(ctx.exception)
        self.assertIn("Invalid DATABASE_URL scheme 'mysql'", msg)
        self.assertNotIn("SuperSecretPass123!", msg)
        self.assertNotIn("admin", msg)

    def test_missing_database_name_raises_improperly_configured(self):
        """Missing database name raises ImproperlyConfigured without exposing credentials."""
        secret_url = "postgresql://user:Secret999@localhost:5432/"
        with self.assertRaises(ImproperlyConfigured) as ctx:
            configure_databases(debug=False, database_url=secret_url, base_dir=self.base_dir)
        msg = str(ctx.exception)
        self.assertIn("database name is required", msg)
        self.assertNotIn("Secret999", msg)

    def test_missing_host_raises_improperly_configured(self):
        """Missing database host raises ImproperlyConfigured without exposing credentials."""
        secret_url = "postgresql://user:Secret999@/study_db"
        with self.assertRaises(ImproperlyConfigured) as ctx:
            configure_databases(debug=False, database_url=secret_url, base_dir=self.base_dir)
        msg = str(ctx.exception)
        self.assertIn("database host is required", msg)
        self.assertNotIn("Secret999", msg)

    def test_invalid_port_raises_improperly_configured(self):
        """Non-numeric or out-of-range port raises ImproperlyConfigured without exposing credentials."""
        secret_url = "postgresql://user:Secret999@localhost:invalidport/study_db"
        with self.assertRaises(ImproperlyConfigured) as ctx:
            configure_databases(debug=False, database_url=secret_url, base_dir=self.base_dir)
        msg = str(ctx.exception)
        self.assertIn("port must be an integer between 1 and 65535", msg)
        self.assertNotIn("Secret999", msg)

        secret_url_out_of_range = "postgresql://user:Secret999@localhost:99999/study_db"
        with self.assertRaises(ImproperlyConfigured) as ctx:
            configure_databases(debug=False, database_url=secret_url_out_of_range, base_dir=self.base_dir)
        msg = str(ctx.exception)
        self.assertIn("port must be an integer between 1 and 65535", msg)
        self.assertNotIn("Secret999", msg)

    def test_valid_postgresql_url_configures_properly_with_unquoting(self):
        """Valid postgresql URL decodes credentials and database names safely."""
        url = "postgresql://db_user:p%40ssword%231@postgres.internal:5433/study%5Fcompanion"
        db_config = configure_databases(debug=False, database_url=url, base_dir=self.base_dir)
        default = db_config["default"]
        self.assertEqual(default["ENGINE"], "django.db.backends.postgresql")
        self.assertEqual(default["NAME"], "study_companion")
        self.assertEqual(default["USER"], "db_user")
        self.assertEqual(default["PASSWORD"], "p@ssword#1")
        self.assertEqual(default["HOST"], "postgres.internal")
        self.assertEqual(default["PORT"], 5433)

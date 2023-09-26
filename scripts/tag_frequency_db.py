import sqlite3
from contextlib import contextmanager

from scripts.shared_paths import TAGS_PATH

db_file = TAGS_PATH.joinpath("tag_frequency.db")
timeout = 30
db_ver = 1


@contextmanager
def transaction(db=db_file):
    """Context manager for database transactions.
    Ensures that the connection is properly closed after the transaction.
    """
    conn = sqlite3.connect(db, timeout=timeout)
    try:
        conn.isolation_level = None
        cursor = conn.cursor()
        cursor.execute("BEGIN")
        yield cursor
        cursor.execute("COMMIT")
    finally:
        conn.close()


class TagFrequencyDb:
    """Class containing creation and interaction methods for the tag frequency database"""

    def __init__(self) -> None:
        self.version = self.__check()

    def __check(self):
        if not db_file.exists():
            print("Tag Autocomplete: Creating frequency database")
            with transaction() as cursor:
                self.__create_db(cursor)
                self.__update_db_data(cursor, "version", db_ver)
            print("Tag Autocomplete: Database successfully created")

        return self.__get_version()

    def __create_db(self, cursor: sqlite3.Cursor):
        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS db_data (
            key TEXT PRIMARY KEY,
            value TEXT
        )
        """
        )

        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS tag_frequency (
            name TEXT NOT NULL,
            type INT NOT NULL,
            count INT,
            last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (name, type)
        )
        """
        )

    def __update_db_data(self, cursor: sqlite3.Cursor, key, value):
        cursor.execute(
            """
        INSERT OR REPLACE
        INTO db_data (key, value)
        VALUES (?, ?)
        """,
            (key, value),
        )

    def __get_version(self):
        with transaction() as cursor:
            cursor.execute(
                """
            SELECT value
            FROM db_data
            WHERE key = 'version'
            """
            )
            db_version = cursor.fetchone()

        return db_version[0] if db_version else 0

    def get_all_tags(self):
        with transaction() as cursor:
            cursor.execute(
                """
            SELECT name, type, count
            FROM tag_frequency
            ORDER BY count DESC
            """
            )
            tags = cursor.fetchall()

        return tags

    def get_tag_count(self, tag, ttype):
        with transaction() as cursor:
            cursor.execute(
                """
            SELECT count
            FROM tag_frequency
            WHERE name = ? AND type = ?
            """,
                (tag,ttype),
            )
            tag_count = cursor.fetchone()

        return tag_count[0] if tag_count else 0

    def get_tag_counts(self, tags: list[str], ttypes: list[str]):
        with transaction() as cursor:
            for tag, ttype in zip(tags, ttypes):
                cursor.execute(
                    """
                SELECT count
                FROM tag_frequency
                WHERE name = ? AND type = ?
                """,
                    (tag,ttype),
                )
                tag_count = cursor.fetchone()
                yield (tag, ttype, tag_count[0]) if tag_count else (tag, ttype, 0)

    def increase_tag_count(self, tag, ttype):
        current_count = self.get_tag_count(tag, ttype)
        with transaction() as cursor:
            cursor.execute(
                """
            INSERT OR REPLACE
            INTO tag_frequency (name, type, count)
            VALUES (?, ?, ?)
            """,
                (tag, ttype, current_count + 1),
            )

    def reset_tag_count(self, tag, ttype):
        with transaction() as cursor:
            cursor.execute(
                """
            UPDATE tag_frequency
            SET count = 0
            WHERE name = ? AND type = ?
            """,
                (tag,ttype),
            )

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
    try:
        conn = sqlite3.connect(db, timeout=timeout)
        
        conn.isolation_level = None
        cursor = conn.cursor()
        cursor.execute("BEGIN")
        yield cursor
        cursor.execute("COMMIT")
    except sqlite3.Error as e:
        print("Tag Autocomplete: Frequency database error:", e)
    finally:
        if conn:
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
            count_pos INT,
            count_neg INT,
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
                f"""
            SELECT name, type, count_pos, count_neg, last_used
            FROM tag_frequency
            WHERE count_pos > 0 OR count_neg > 0
            ORDER BY count_pos + count_neg DESC
            """
            )
            tags = cursor.fetchall()

        return tags

    def get_tag_count(self, tag, ttype, negative=False):
        count_str = "count_neg" if negative else "count_pos"
        with transaction() as cursor:
            cursor.execute(
                f"""
            SELECT {count_str}, last_used
            FROM tag_frequency
            WHERE name = ? AND type = ?
            """,
                (tag, ttype),
            )
            tag_count = cursor.fetchone()

        if tag_count:
            return tag_count[0], tag_count[1]
        else:
            return 0, None

    def get_tag_counts(self, tags: list[str], ttypes: list[str], negative=False, date_limit=None):
        count_str = "count_neg" if negative else "count_pos"
        with transaction() as cursor:
            for tag, ttype in zip(tags, ttypes):
                if date_limit is not None:
                    cursor.execute(
                        f"""
                    SELECT {count_str}, last_used
                    FROM tag_frequency
                    WHERE name = ? AND type = ?
                    AND last_used > datetime('now', '-' || ? || ' days')
                    """,
                        (tag, ttype, date_limit),
                    )
                else:
                    cursor.execute(
                        f"""
                    SELECT {count_str}, last_used
                    FROM tag_frequency
                    WHERE name = ? AND type = ?
                    """,
                        (tag, ttype),
                    )
                tag_count = cursor.fetchone()
                if tag_count:
                    yield (tag, ttype, tag_count[0], tag_count[1]) 
                else:
                    yield (tag, ttype, 0, None)

    def increase_tag_count(self, tag, ttype, negative=False):
        pos_count = self.get_tag_count(tag, ttype, False)[0]
        neg_count = self.get_tag_count(tag, ttype, True)[0]

        if negative:
            neg_count += 1
        else:
            pos_count += 1

        with transaction() as cursor:
            cursor.execute(
                f"""
            INSERT OR REPLACE
            INTO tag_frequency (name, type, count_pos, count_neg)
            VALUES (?, ?, ?, ?)
            """,
                (tag, ttype, pos_count, neg_count),
            )

    def reset_tag_count(self, tag, ttype, positive=True, negative=False):
        if positive and negative:
            set_str = "count_pos = 0, count_neg = 0"
        elif positive:
            set_str = "count_pos = 0"
        elif negative:
            set_str = "count_neg = 0"

        with transaction() as cursor:
            cursor.execute(
                f"""
            UPDATE tag_frequency
            SET {set_str}
            WHERE name = ? AND type = ?
            """,
                (tag, ttype),
            )

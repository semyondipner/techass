from decouple import config
from sqlmodel import Session, SQLModel, create_engine

database_connection_string = config('CONNECTION_STRING')
engine_url = create_engine(database_connection_string, echo=True)


def conn():
    SQLModel.metadata.create_all(engine_url)


def get_session():
    with Session(engine_url) as session:
        yield session

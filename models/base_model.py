from pymongo import MongoClient
from typing import Dict, Any, List, TypeVar, Type

T = TypeVar('T', bound='BaseModel')  # Type variable for class methods

class BaseModel:
    # Initialize client and db as class attributes
    # In a real application, you might want to manage this connection differently
    # (e.g., as a singleton or part of app context)
    _client = None
    _db = None

    @classmethod
    def _get_db(cls):
        if cls._client is None or cls._db is None:
            # print("Initializing MongoDB connection for BaseModel...") # For debugging
            cls._client = MongoClient('mongodb://localhost:27017/')
            cls._db = cls._client['security_policy_db']
            # print(f"DB initialized: {cls._db.name}") # For debugging
        return cls._db

    @classmethod
    def _get_collection_name(cls) -> str:
        # Derives collection name from class name (e.g., User -> users)
        return cls.__name__.lower() + 's'

    @classmethod
    def collection(cls):
        db = cls._get_db()
        collection_name = cls._get_collection_name()
        # print(f"Accessing collection: {collection_name} in db: {db.name}") # For debugging
        return db[collection_name]

    @classmethod
    def get_by_id(cls: Type[T], doc_id: str) -> T | None:
        # print(f"Getting {cls.__name__} by id: {doc_id}") # For debugging
        document = cls.collection().find_one({'_id': doc_id})
        return cls.from_dict(document) if document else None

    @classmethod
    def get_all(cls: Type[T]) -> List[T]:
        # print(f"Getting all {cls.__name__}s") # For debugging
        documents = cls.collection().find({})
        return [cls.from_dict(doc) for doc in documents if doc]

    def save(self: T) -> None:
        # print(f"Saving {self.__class__.__name__} with id: {getattr(self, 'id', getattr(self, '_id', 'N/A'))}") # For debugging
        doc_data = self.to_dict()
        doc_id = doc_data.get('_id')
        if not doc_id:
            # This case should ideally be handled by ensuring 'id' is set before save
            # or by letting MongoDB generate an ID if that's the design
            raise ValueError("Document must have an '_id' to save.")
        self.collection().update_one({'_id': doc_id}, {'$set': doc_data}, upsert=True)

    def delete(self: T) -> None:
        doc_id = getattr(self, 'id', getattr(self, '_id', None))
        if not doc_id:
            raise ValueError("Document must have an 'id' or '_id' to delete.")
        # print(f"Deleting {self.__class__.__name__} with id: {doc_id}") # For debugging
        self.collection().delete_one({'_id': doc_id})

    @classmethod
    def from_dict(cls: Type[T], data: Dict[str, Any]) -> T:
        # This method must be implemented by subclasses
        raise NotImplementedError("Subclasses must implement from_dict")

    def to_dict(self: T) -> Dict[str, Any]:
        # This method must be implemented by subclasses
        raise NotImplementedError("Subclasses must implement to_dict")

    # Helper for specific collection access if needed
    @classmethod
    def get_capability_lists_collection(cls):
        # Special case for 'capability_lists' as it's singular in db schema but class might be CapabilityList
        db = cls._get_db()
        return db['capability_lists']

    @classmethod
    def get_access_history_collection(cls):
        db = cls._get_db()
        return db['access_history'] 
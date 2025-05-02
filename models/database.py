from pymongo import MongoClient
from typing import Dict, Any

class Database:
    def __init__(self):
        self.client = MongoClient('mongodb://localhost:27017/')
        self.db = self.client['security_policy_db']
        
        # Collections
        self.users = self.db['users']
        self.roles = self.db['roles']
        self.objects = self.db['objects']
        self.datasets = self.db['datasets']
        self.conflict_classes = self.db['conflict_classes']
        self.access_history = self.db['access_history']
        self.capability_lists = self.db['capability_lists']
        
    def save_document(self, collection_name: str, document: Dict[str, Any]) -> str:
        collection = self.db[collection_name]
        if '_id' in document:
            result = collection.replace_one({'_id': document['_id']}, document, upsert=True)
        else:
            result = collection.insert_one(document)
        return str(result.upserted_id or document.get('_id'))
    
    def get_document(self, collection_name: str, doc_id: str) -> Dict[str, Any]:
        collection = self.db[collection_name]
        return collection.find_one({'_id': doc_id})
    
    def get_all_documents(self, collection_name: str) -> list:
        collection = self.db[collection_name]
        return list(collection.find({}))
    
    def delete_document(self, collection_name: str, doc_id: str) -> bool:
        collection = self.db[collection_name]
        result = collection.delete_one({'_id': doc_id})
        return result.deleted_count > 0
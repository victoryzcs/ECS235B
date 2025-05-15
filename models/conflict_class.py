from typing import List, Dict, Any
from .base_model import BaseModel

class ConflictClass(BaseModel):
    # Override collection name because it's 'conflict_classes' not 'conflictclasss'
    @classmethod
    def _get_collection_name(cls) -> str:
        return 'conflict_classes'

    def __init__(self, class_id: str, name: str, datasets: List[str] = None):
        self.id = class_id  # Use class_id as the primary ID, maps to _id
        self.name = name
        self.datasets = datasets if datasets is not None else []

    def to_dict(self) -> Dict[str, Any]:
        return {
            '_id': self.id, # Save as _id
            'name': self.name,
            'datasets': self.datasets
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ConflictClass':
        if not data:
            return None
        return cls(
            class_id=data['_id'], # Load from _id
            name=data.get('name'),
            datasets=data.get('datasets', [])
        )

if __name__ == "__main__":
    conflict_class_1 = ConflictClass(class_id="1", name="Conflict Class 1", datasets=["Dataset 1", "Dataset 2"])
    print(ConflictClass.from_dict(conflict_class_1.to_dict()))
    conflict_class_2 = ConflictClass(class_id="2", name="Conflict Class 2", datasets=["Dataset 3", "Dataset 4"])
    print(ConflictClass.from_dict(conflict_class_2.to_dict()))

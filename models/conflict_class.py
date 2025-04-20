from typing import List, Dict
from pydantic import BaseModel, Field

class ConflictClass(BaseModel):
    class_id: str
    name: str
    datasets: List[str] = Field(default_factory=list)

    def to_dict(self):
        return {
            "class_id": self.class_id,
            "name": self.name,
            "datasets": self.datasets
        }
    @classmethod
    def from_dict(cls, data):
        return cls(
            class_id=data.get("class_id"),
            name=data.get("name"),
            datasets=data.get("datasets", [])
        )

if __name__ == "__main__":
    conflict_class_1 = ConflictClass(class_id="1", name="Conflict Class 1", datasets=["Dataset 1", "Dataset 2"])
    print(ConflictClass.from_dict(conflict_class_1.to_dict()))
    conflict_class_2 = ConflictClass(class_id="2", name="Conflict Class 2", datasets=["Dataset 3", "Dataset 4"])
    print(ConflictClass.from_dict(conflict_class_2.to_dict()))

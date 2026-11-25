import shutil
from pathlib import Path

from app import DATASET_DIR, download_dataset
from ultralytics import YOLO


HERE = Path(__file__).resolve().parent
DATA_YAML = DATASET_DIR / "data.yaml"
OUTPUT_DIR = HERE / "runs" / "segment"
FINAL_WEIGHTS = HERE / "best.pt"


def main():
    dataset_path = DATASET_DIR if DATA_YAML.is_file() else download_dataset()
    data_yaml = Path(dataset_path) / "data.yaml"
    if not data_yaml.is_file():
        raise FileNotFoundError(
            f"Could not find data.yaml in {dataset_path}. Check the Roboflow export format."
        )

    # Fine-tune a small pretrained segmentation model on the project's crop dataset.
    model = YOLO("yolov8n-seg.pt")
    model.train(
        data=str(data_yaml),
        epochs=100,
        imgsz=640,
        batch=4,
        project=str(OUTPUT_DIR),
        name="shefarms-crops",
        exist_ok=True,
    )

    best_weights = Path(model.trainer.best)
    if not best_weights.is_file():
        raise FileNotFoundError(f"Training finished but best.pt was not found at {best_weights}")

    shutil.copy2(best_weights, FINAL_WEIGHTS)
    print(f"Training complete. API model saved to: {FINAL_WEIGHTS}")


if __name__ == "__main__":
    main()

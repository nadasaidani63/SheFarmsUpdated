import os
from pathlib import Path


WORKSPACE = os.getenv("ROBOFLOW_WORKSPACE", "wie-qr8jy")
PROJECT = os.getenv("ROBOFLOW_PROJECT", "segmentation-of-uav-crop-images-pzdsj")
VERSION = int(os.getenv("ROBOFLOW_VERSION", "1"))
DATASET_DIR = Path(__file__).resolve().parent / "dataset"


def download_dataset():
    api_key = os.getenv("ROBOFLOW_API_KEY")
    if not api_key:
        raise RuntimeError(
            "Set ROBOFLOW_API_KEY in this PowerShell session before downloading the dataset."
        )

    from roboflow import Roboflow

    roboflow = Roboflow(api_key=api_key)
    project = roboflow.workspace(WORKSPACE).project(PROJECT)
    dataset = project.version(VERSION).download("yolov8", location=str(DATASET_DIR))
    dataset_location = Path(dataset.location).resolve()
    print(f"Dataset downloaded to: {dataset_location}")
    return dataset_location


if __name__ == "__main__":
    download_dataset()

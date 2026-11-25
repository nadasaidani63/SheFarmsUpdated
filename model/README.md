# SheFarms AI API

From this directory, install the small API runtime and start the backend:

```powershell
python -m pip install -r requirements.txt
python main.py
```

The API listens on `http://127.0.0.1:8000`. Check `http://127.0.0.1:8000/health` to confirm it is reachable. The health response reports whether the model is loaded.

## Accounts

The login and registration forms use this API. There are no seeded accounts: create an account once from the app's **Sign up** page, then sign in with that email and password. Accounts and hashed passwords are stored in `shefarms.sqlite3` beside this file. Sessions expire after seven days.

## Train the AI model yourself

The repository includes the trained `best.pt` checkpoint currently used by the project. The crop dataset and original training artifacts are not included. The original downloader points to a Roboflow dataset (workspace `wie-qr8jy`, project `segmentation-of-uav-crop-images-pzdsj`, version 1). To retrain, you need permission to access that dataset and a Roboflow API key. If the dataset is private or unavailable, ask its owner for access or use your own annotated crop dataset in Ultralytics YOLO segmentation format.

In PowerShell, go to this `model` directory and run these commands one at a time:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements-train.txt
$env:ROBOFLOW_API_KEY = "YOUR_ROBOFLOW_API_KEY"
.\.venv\Scripts\python.exe .\train_model.py
```

Get the API key from your own Roboflow account and keep it private; do not commit it or send it in chat. The script downloads the dataset into `model/dataset`, fine-tunes a small pretrained YOLOv8 segmentation model, and copies the resulting checkpoint to `model/best.pt`. Training downloads pretrained weights too, so internet access is needed for package installation, dataset download, and the initial training run. CPU training can take a long time.

If the dataset is already downloaded, `train_model.py` reuses `model/dataset/data.yaml` without downloading it again. You can also set `ROBOFLOW_WORKSPACE`, `ROBOFLOW_PROJECT`, and `ROBOFLOW_VERSION` to select a dataset you can access; the export must be YOLO segmentation format.

Image detection requires the included `best.pt` checkpoint and the optional AI dependencies:

```powershell
python -m pip install -r requirements-ai.txt
```

Without the checkpoint, the API still starts and reports that image detection is unavailable; `/predict` returns HTTP 503 with the reason. The checkpoint is ignored by `model/.gitignore` for ordinary training workflows, so it must be explicitly added when preparing a clone that should include image analysis.

Set `MODEL_PATH` to use a checkpoint at another path. Set `HOST` or `PORT` to change the bind address or port.

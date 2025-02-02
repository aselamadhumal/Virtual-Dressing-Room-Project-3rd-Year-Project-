import { Button, FileInput, Select, TextInput, Toast } from "flowbite-react";
import { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "./../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { HiCheck, HiExclamation, HiX } from "react-icons/hi";

export default function CreateDress() {
  const [file, setFile] = useState(null);
  const [imgUploadProgress, setImgUploadProgress] = useState(null);
  const [imgUploadError, setImgUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [tostMsg, setTostmsg] = useState(false);
  const [isCustomizable, setIsCustomizable] = useState(false);

  console.log(formData);

  const handleUploadImg = async () => {
    try {
      if (!file) {
        setImgUploadError("Please select a file");
        return;
      }
      setImgUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setImgUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImgUploadError(error.message);
          setImgUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadUrl) => {
              setImgUploadError(null);
              setImgUploadProgress(null);
              // Assuming you have a setFormData function defined somewhere, you can use it here
              setFormData({ ...formData, imageUrl: downloadUrl });
            })
            .catch((error) => {
              setImgUploadError(error.message);
              setImgUploadProgress(null);
            });
        }
      );
    } catch (error) {
      setImgUploadProgress(null);
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(formData).length === 0) {
      return;
    }

    try {
      const res = await fetch("/api/cloth/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(data);
        setTostmsg(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">
        Create a Dress
      </h1>
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Dress Name"
            id="dressName"
            className="flex-1"
            onChange={(e) =>
              setFormData({ ...formData, dressName: e.target.value })
            }
          />
          <Select
            id="genderType"
            onChange={(e) =>
              setFormData({ ...formData, genderType: e.target.value })
            }
          >
            <option>Gender</option>
            <option value="Women">Women</option>
            <option value="Men">men</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="button"
            gradientDuoTone="purpleToBlue"
            size="sm"
            outline
            onClick={handleUploadImg}
            disabled={imgUploadProgress}
          >
            {imgUploadProgress ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imgUploadProgress}
                  text={`${imgUploadProgress || 0}%`}
                />
              </div>
            ) : (
              "Upload Img"
            )}
          </Button>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Discription"
            id="Discription"
            className="flex-1"
            onChange={(e) =>
              setFormData({ ...formData, Discription: e.target.value })
            }
          />
          <TextInput
            type="number"
            placeholder="Price"
            id="price"
            className="flex-1"
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
          />

          <Select
            id="clothType"
            onChange={(e) =>
              setFormData({ ...formData, clothType: e.target.value })
            }
          >
            <option>Cloth Type</option>
            <option value="Top">Top</option>
            <option value="Bottom">Bottom</option>
          </Select>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="checkbox"
            style={{ marginRight: "1rem" }}
            checked={isCustomizable}
            onChange={() => {
              setIsCustomizable(!isCustomizable);
              setFormData({ ...formData, isCustomizable: !isCustomizable });
            }}
          />
          <span>Is this Dress Customizable Item</span>
        </div>
        <Button
          type="submit"
          disabled={imgUploadProgress}
          gradientDuoTone="purpleToPink"
          onClick={handleSubmit}
        >
          Create Dress
        </Button>
      </form>

      {tostMsg && (
        <Toast className="mt-10">
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
            <HiCheck className="h-5 w-5" />
          </div>
          <div className="ml-3 text-sm font-normal">
            Item Added successfully.
          </div>
          <Toast.Toggle />
        </Toast>
      )}
    </div>
  );
}

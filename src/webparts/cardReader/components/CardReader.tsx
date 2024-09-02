import * as React from "react";
import type { ICardReaderProps } from "./ICardReaderProps";
import { Field, Image, makeStyles, Spinner } from "@fluentui/react-components";
import { Input } from "@fluentui/react-northstar";
import { SPFI } from "@pnp/sp";
import { getSP } from "../pnpjsConfig";
// import "@fluentui/react/dist/css/fabric.min.css";

export interface Root {
  "@odata.context": string;
  responsev2: Responsev2;
}

export interface Responsev2 {
  "@odata.type": string;
  operationStatus: string;
  predictionId: string;
  predictionOutput: PredictionOutput;
}

export interface PredictionOutput {
  "@odata.type": string;
  "contactFields@odata.type": string;
  contactFields: ContactField[];
  contact: Contact;
  cleanedImage: CleanedImage;
}

export interface ContactField {
  "@odata.type": string;
  parentName: string;
  name: string;
  value: string;
  "boundingBox@odata.type": string;
  boundingBox: BoundingBox[];
}

export interface BoundingBox {
  "@odata.type": string;
  left: number;
  top: number;
  width: number;
  height: number;
  polygon: Polygon;
}

export interface Polygon {
  "@odata.type": string;
  "coordinates@odata.type": string;
  coordinates: Coordinate[];
}

export interface Coordinate {
  "@odata.type": string;
  x: number;
  y: number;
}

export interface Contact {
  "@odata.type": string;
  fullName: string;
  title: string;
  mobilePhone: string;
  phone2: string;
  email: string;
  firstName: string;
  lastName: string;
  website: string;
}
export interface Model {
  fullName: string;
  title: string;
  mobilePhone: string;
  phone2: string;
  email: string;
  website: string;
  firstName: string;
  lastName: string;
}
export interface CleanedImage {
  "@odata.type": string;
  base64Encoded: string;
  mimeType: string;
}

const useStyles = makeStyles({
  containerCardReader: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
});

const CardReader = ({}: ICardReaderProps) => {
  const classes = useStyles();
  const [sp, setSp] = React.useState<SPFI | null>(null);
  const [load, setLoad] = React.useState(false);
  const [model, setModel] = React.useState({} as Model);
  const [cardImage, setCardImage] = React.useState(
    "https://fabricweb.azureedge.net/fabric-website/placeholders/100x100.png"
  );

  React.useEffect(() => {
    setSp(getSP());
  }, []);
  const readImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();

    //@ts-ignore
    fileReader.readAsDataURL(event.target.files[0]);
    fileReader.onload = async () => {
      //@ts-ignore
      const fileNamePath = encodeURI((event.target.files[0] as File).name);

      setCardImage(fileReader.result as string);

      const file = await (sp as SPFI).web
        .getFolderByServerRelativePath("Shared Documents")
        //@ts-ignore
        .files.addUsingPath(fileNamePath, event.target.files[0], {
          Overwrite: true,
        });
      const currFile = await file.file.getItem();
      const myHeaders = new Headers();

      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        //@ts-ignore
        pathFile: currFile["ID"],
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      setLoad(true);
      const request = await fetch(
        "",
        //@ts-ignore
        requestOptions
      );
      const json: Root = await request.json();

      const builderObject =
        json.responsev2.predictionOutput.contactFields.reduce((acc, curr) => {
          return {
            ...acc,
            [curr.name]: curr.value,
          };
        }, {});
      setLoad(false);
      setModel(builderObject as Model);
    };
  };

  return (
    <section className={classes.containerCardReader}>
      <div>
        <Image
          fit="contain"
          alt="Allan's avatar"
          src={cardImage}
          height={200}
          width={"100%"}
        />
      </div>

      {load ? (
        <div>
          <Spinner
            appearance="primary"
            label="Loading data into the model..."
          />
        </div>
      ) : (
        <div>
          <Field
            label="Full name"
            validationState="success"
            validationMessage="This is a success message."
          >
            <Input value={model.fullName} />
          </Field>

          <Field
            label="Email"
            validationState="success"
            validationMessage="This is a success message."
          >
            <Input value={model.email} />
          </Field>

          <Field
            label="Business Phone"
            validationState="success"
            validationMessage="This is a success message."
          >
            <Input value={model.mobilePhone} />
          </Field>

          <Field
            label="Website"
            validationState="success"
            validationMessage="This is a success message."
          >
            <Input value={model.website} />
          </Field>
          <input type="file" accept="image/*" onChange={readImage} />
        </div>
      )}
    </section>
  );
};

export default CardReader;

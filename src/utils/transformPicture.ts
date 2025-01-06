export default function transformPicture(object: any) {
  return {
    ...object,
    picture: object.picture
      ? `data:${
          object.picture.contentType
        };base64,${object.picture.buffer.toString("base64")}`
      : undefined,
  };
}

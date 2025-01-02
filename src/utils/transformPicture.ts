export default function transformPicture(document: any) {
  const object = document.toObject();
  return {
    ...document.toObject(),
    picture: object.picture
      ? `data:${object.contentType};base64,${object.picture.buffer.toString(
          "base64"
        )}`
      : undefined,
  };
}

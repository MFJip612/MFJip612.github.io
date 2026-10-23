import type { InspectImage, MakePublicVariant } from "./image-pipeline.types";

function unavailable(): never {
	throw new Error("图片管线只能在服务端运行");
}

export const inspectImage: InspectImage = unavailable;
export const makePublicVariant: MakePublicVariant = unavailable;

export type PublicFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialPublicFormState: PublicFormState = { status: "idle", message: "" };

// let apiUrl: string =
//   "https://3f40-2a09-bac5-3a11-25cd-00-3c4-28.ngrok-free.app";
let apiUrl: string = "https://dcc6-2a09-bac5-3a21-88c-00-da-c2.ngrok-free.app";
// export const apiUrl: string = ;
if (process.env.NEXT_PUBLIC_MODE == "production") {
  apiUrl = "https://aerplus2.src-group.net";
}
export const baseUrl: string = apiUrl;

export const baseApiUrl: string = `${baseUrl}/api`;

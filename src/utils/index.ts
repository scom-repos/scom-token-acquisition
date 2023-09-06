import { application } from "@ijstech/components";

const getIPFSBaseUrl = () => {
  let url = `${window.location.origin}/ipfs/`;
  return `https://dev.decom.app/ipfs/`;
}

export const getEmbedElement = async (path: string) => {
  if (path.startsWith("libs/@scom/")) path = path.slice(11);
  const element = await application.createElement(path);
  return element;
}

export const getWidgetData = async (dataUri: string) => {
  let widgetData: any;
  try {
    const ipfsBaseUrl = getIPFSBaseUrl();
    const scconfigResponse = await fetch(`${ipfsBaseUrl}${dataUri}/scconfig.json`);
    const scconfigResult = await scconfigResponse.json();
    widgetData = scconfigResult.widgetData;
  } catch (err) {}
  return widgetData
}

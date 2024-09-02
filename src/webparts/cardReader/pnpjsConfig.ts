import { WebPartContext } from "@microsoft/sp-webpart-base";

// import pnp and pnp logging system
import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";


// eslint-disable-next-line no-var
//@ts-ignore
let _sp: SPFI = null;

export const getSP = (context?: WebPartContext): SPFI => {
    if (!!context) {

        _sp = spfi().using(SPFx(context))
    }
    return _sp;
};
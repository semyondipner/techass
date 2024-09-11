import { environment } from "../../environments/environment";
const api = environment.api;
export const URLs = {
    churn: {
        years: api + 'churn_region_qrt',
        acc: api + 'acc_churn_t1',
        region: api + 'loss_region_qrt'
    }
}

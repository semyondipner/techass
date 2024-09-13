import { environment } from "../../environments/environment";
const api = environment.api;
export const URLs = {
    prediction: {
        upload: api + 'prediction/upload_data',
        predict: api + 'prediction/predict'
    },

    analytics: {
        analytics: api + 'analytics/get_stores',
        items: api + 'analytics/get_items',
        kpis: api + 'analytics/get_kpis',
        tables: api + 'analytics/get_tables',
        charts: api + 'analytics/get_charts',
    }
}

import { environment } from "../../environments/environment";
const api = environment.api;
const apiV2 = environment.apiV2;
export const URLs = {
    prediction: {
        upload: api + 'loader/upload_data',
        clustering: api + 'loader/get_clustering',
        clusters: api + 'loader/get_clusters',
        decomposition: api + 'loader/get_decomposition',
        predict: apiV2 + 'prediction/get_history_item_id',
        pred: apiV2 + 'prediction/get_prediction_item_id',
    },

    analytics: {
        analytics: api + 'analytics/get_stores',
        items: api + 'analytics/get_items',
        kpis: api + 'analytics/get_kpis',
        tables: api + 'analytics/get_tables',
        charts: api + 'analytics/get_charts',
    }
}

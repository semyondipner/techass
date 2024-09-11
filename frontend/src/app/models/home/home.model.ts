export interface IChurnYears {
    year: number,
    quarter: string, 
    region: string,
    churn: number,
    qrtr_numb: number
}

export interface IAccChurn {
    client_id: string,
    npo_account_id: string,
    churn_prop: number,
    gender: string,
    age: number,
    region: string,
    npo_accnts_nmbr: number,
    pmnts_type: string,
    balance: number,
    lst_pmnt_date_per_qrtr: string,
    phone_number: string,
    email: string,
    lk: string
}

export interface IRegion {
    id: number,
    region: string,
    year: number,
    quarter: string,
    balance: number,
    lst_pmnt: number
}
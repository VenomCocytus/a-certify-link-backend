export interface AsaciCertificate {
    production: {
        reference: string;
    };
    reference: string;
    state: {
        name: string;
        label: string;
    };
    download_link: string;
    licence_plate: string;
    chassis_number: string;
    police_number: string;
    insured_name: string;
    starts_at: string;
    ends_at: string;
    printed_at: string;
}

export interface AsaciOrganization {
    id: string;
    code: string;
    name: string;
    address: string;
    email: string;
    telephone: string;
    logo_url: string;
    disabled_at: string | null;
    is_disabled: boolean;
    created_at: string;
    formatted_created_at: string;
    updated_at: string;
    formatted_updated_at: string;
}

export interface AsaciResponsePayload {
    status: number;
    message: string;
    data: {
        id: string;
        reference: string;
        sent_to_storage: string | null;
        channel: string;
        download_link: string;
        created_at: string;
        quantity: number;
        formatted_created_at: string;
        organization: AsaciOrganization;
        certificates: AsaciCertificate[];
    };
}
import { toast } from "sonner";

export const deleteDeal = async (dealId: string, fetchWithAuth: any) => {
    const res = await fetchWithAuth(`/api/crm/deals/${dealId}`, {
        method: 'DELETE',
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete deal');
    }

    return true;
};

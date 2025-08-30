import { useState, useEffect } from 'react';

interface Company {
    companyId: number;
    name: string;
    logoPath?: string;
}

export const useCompanies = () => {
    const [companies, setCompanies] = useState<Company[]>([]);

    useEffect(() => {
        const loadCompanyList = async () => {
            try {
                const response = await fetch('/api/public/companies?page=0&size=16');
                if (response.ok) {
                    const data = await response.json();
                    const companiesData = data.companies.map((company: any) => ({
                        companyId: company.id,
                        name: company.name,
                        logoPath: company.logoPath
                    }));
                    setCompanies(companiesData);
                } else {
                    console.error('회사 목록 로드 실패:', response.status);
                    setCompanies([]);
                }
            } catch (error) {
                console.error('회사 목록 로드 실패:', error);
                setCompanies([]);
            }
        };

        loadCompanyList();
    }, []);

    return { companies };
};

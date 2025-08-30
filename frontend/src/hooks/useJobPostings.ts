import { useState, useEffect } from 'react';

interface JobPosting {
    jobPostingId: string;
    name: string;
    location: string;
    experienceLevel: string;
    preferredDeveloperTypes: string[];
    jobImageFileName?: string;
}

export const useJobPostings = () => {
    const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);

    useEffect(() => {
        const loadJobPostings = async () => {
            try {
                // 공고 가져오기 로직 작성할 것
                setJobPostings([]);
            } catch (error) {
                console.error('채용 공고 로드 실패:', error);
            }
        };

        loadJobPostings();
    }, []);

    return { jobPostings };
};

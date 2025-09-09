import { useState, useEffect } from 'react';
import postService from '../services/postService';

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
                const data = await postService.getPostList({ pageIndex: 0, pageSize: 4 });
                const processedJobPostings = (data.jobPostings || []).map((posting: any) => {
                    let developerTypes: string[] = [];
                    if (typeof posting.preferredDeveloperTypes === 'string') {
                        try {
                            // Attempt to parse as JSON array
                            developerTypes = JSON.parse(posting.preferredDeveloperTypes);
                        } catch (e) {
                            // Fallback to comma-separated if JSON parsing fails
                            developerTypes = posting.preferredDeveloperTypes.split(',').map((type: string) => type.trim());
                        }
                    } else if (Array.isArray(posting.preferredDeveloperTypes)) {
                        developerTypes = posting.preferredDeveloperTypes;
                    }
                    return {
                        ...posting,
                        preferredDeveloperTypes: developerTypes
                    };
                });
                setJobPostings(processedJobPostings);
            } catch (error) {
                console.error('채용 공고 로드 실패:', error);
                setJobPostings([]); // Ensure state is reset on error
            }
        };

        loadJobPostings();
    }, []);

    return { jobPostings };
};

import { useState, useEffect } from 'react';

const useInitialLoad = (delay = 1000) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    return isLoading;
};

export default useInitialLoad;

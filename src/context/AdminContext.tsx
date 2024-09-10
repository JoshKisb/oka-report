import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDataEngine } from '@dhis2/app-runtime';

interface AdminContextType {
    isAuthorized: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
    children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const engine = useDataEngine();

    useEffect(() => {
        checkIfAdmin();
    }, []);

    const checkIfAdmin = async () => {
        try {
            const { me } = await engine.query({
                me: {
                    resource: 'me.json',
                    params: {
                        fields: 'userCredentials[userRoles]',
                    },
                },
            });
            const roles = me?.userCredentials?.userRoles;
            const isAdmin = roles?.some((role: { id: string }) => role.id === 'yrB6vc5Ip3r');
            setIsAuthorized(isAdmin);
        } catch (e) {
            console.log(e);
            setIsAuthorized(false);
        }
    };

    return (
        <AdminContext.Provider value={{ isAuthorized }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = (): AdminContextType => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

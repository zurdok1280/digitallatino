import React from 'react';

interface ResponsiveContentWrapperProps {
    children: React.ReactNode;
    className?: string;
}

export const ResponsiveContentWrapper: React.FC<ResponsiveContentWrapperProps> = ({
    children,
    className = ''
}) => {
    return (
        <div className={`w-full overflow-x-hidden ${className}`}>
            <div className="w-full max-w-full">
                {children}
            </div>
        </div>
    );
};
import React from 'react';

export const Card = ({ className, title, titleAction, children,footer }) => {
    return (
        <div className={className}>
            <div className="card">
                <div className="card-header">
                    <h4>{title}</h4>
                    <div className='card-header-action'>
                        {titleAction}
                    </div>
                </div>
                <div className="card-body">
                    {children}
                </div>
                {footer && <div className="card-footer  bg-whitesmoke">
                    {footer}
                </div>}
                
            </div>
        </div>
    );
};


export const CardWithMedia = ({ title, children,className }) => {
    return (
       <div className={className}>
            <div className="card-header">
                <h4>{title}</h4>
            </div>
            <div className="card-body">
                <div className="media">
                <img className="mr-3" src="assets/img/image-64.png" alt="Generic placeholder image" />
                <div className="media-body">
                    <h5 className="mt-0">Media heading</h5>
                    <p>{children}</p>
                    </div>
                </div>
            </div>
        </div>

    );
};
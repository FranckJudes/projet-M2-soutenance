export const styles = {
    h4: {  
        fontSize: '17px',         
        lineHeight: '28px',           
        paddingRight: '10px',    
        marginBottom: '0',       
        color: '#212529',       
        margin: '7px'   
    },
    settingSidebar: {
        background: '#fff',
        position: 'fixed',
        height: '100%',
        width: '500px',
        top: '70px',
        right: '-600px', 
        zIndex: 999,
        transition: 'all 0.3s ease-in-out',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.16), 0 2px 10px rgba(0, 0, 0, 0.12)' 
    },
    showSettingPanel:{
        right: '0'
    },
    transitionContainer : {
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        opacity: 1,
    },
    fadeOut: {
        opacity: 0,
        transform: 'translateY(-20px)', 
    }
};
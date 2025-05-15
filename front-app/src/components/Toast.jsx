import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

export const useToast = () => {
 
    const showToast = ({ title, message, color = 'blue', position = 'topRight' }) => {
        iziToast.show({
            title,
            message,
            color,
            position,
        });
    };

    return { showToast };
};

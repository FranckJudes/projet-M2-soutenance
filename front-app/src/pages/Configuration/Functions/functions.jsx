import domtoimage from 'dom-to-image';
import { useToast } from '../../../components/Toast';
export const handleDownloadXML = async (modelerRef) => {
    const { showToast } = useToast();

    try {
        const { xml } = await modelerRef.current.saveXML({ format: true }); // Ajout du format si nécessaire
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([xml], { type: 'application/xml' }));
        link.download = 'diagram.bpmn';
        link.click();
        showToast({
            title: "Success",
            message: "Telechargement reussi.",
            color: "green",
            position: "topRight",
        }); 
    } catch (err) {
        console.error('Erreur lors du téléchargement du XML:', err);
    }
};

export const handleDownloadSVG = async (modelerRef) => {
    const { showToast } = useToast();

    try {
        const { svg } = await modelerRef.current.saveSVG();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        link.download = 'diagram.svg';
        link.click();
        showToast({
            title: "Success",
            message: "Telechargement reussi.",
            color: "green",
            position: "topRight",
        }); 
    } catch (err) {
        console.error('Erreur lors du téléchargement du SVG:', err);
    }
};

export const handleDownloadPNG = async (canvasRef) => {
    const { showToast } = useToast();

    try {
        const node = canvasRef.current;
        const dataURL = await domtoimage.toPng(node);
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'diagram.png';
        link.click();
        showToast({
            title: "Success",
            message: "Telechargement reussi.",
            color: "green",
            position: "topRight",
        }); 
    } catch (err) {
        console.error('Erreur lors du téléchargement du PNG:', err);
    }
};

export const handleUploadBPMN = async (event, modelerRef) => {
    const { showToast } = useToast();
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                await modelerRef.current.importXML(event.target.result);
                showToast({
                    title: "Success",
                    message: "Import reussi.",
                    color: "green",
                    position: "topRight",
                }); 
            } catch (err) {
                console.error('Erreur lors du chargement du fichier BPMN:', err);
            }
        };
        reader.readAsText(file);
    }
};
const exportDiagram = async (modelerRef) => {
    try {
        const { xml } = await modelerRef.current.saveXML({ format: true });
        return xml; 
    } catch (err) {
        console.error("Erreur lors de l'exportation du diagramme :", err);
        return null;
    }
};

export const handleDownloadJSON = async (modelerRef) => {
    if (modelerRef.current) {
        try {
            const { xml } = await modelerRef.current.saveXML({ format: true });
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, "text/xml");
            const json = xmlToJson(xmlDoc);

            const jsonString = JSON.stringify(json, null, 2);

            // Télécharger le fichier JSON
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "diagram.json";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Erreur lors de l'exportation en JSON :", err);
        }
    }
};
import BpmnModdle from 'bpmn-moddle';

export const isInSubProcess = (elementId, subProcesses) => {
    if (!Array.isArray(subProcesses)) return false;
  
    for (const subProcess of subProcesses) {
      if (Array.isArray(subProcess.tasks) && subProcess.tasks.some(task => task.id === elementId)) {
        return true;
      }
      if (Array.isArray(subProcess.events) && subProcess.events.some(event => event.id === elementId)) {
        return true;
      }
      if (Array.isArray(subProcess.gateways) && subProcess.gateways.some(gateway => gateway.id === elementId)) {
        return true;
      }
      if (Array.isArray(subProcess.subProcesses)) {
        for (const nestedSubProcess of subProcess.subProcesses) {
          if (isElementInSubProcess(elementId, nestedSubProcess)) {
            return true;
          }
        }
      }
    }
    return false;
  };
  
  const isElementInSubProcess = (elementId, subProcess) => {
    if (Array.isArray(subProcess.tasks) && subProcess.tasks.some(task => task.id === elementId)) {
      return true;
    }
    if (Array.isArray(subProcess.events) && subProcess.events.some(event => event.id === elementId)) {
      return true;
    }
    if (Array.isArray(subProcess.gateways) && subProcess.gateways.some(gateway => gateway.id === elementId)) {
      return true;
    }
    if (Array.isArray(subProcess.subProcesses)) {
      for (const nestedSubProcess of subProcess.subProcesses) {
        if (isElementInSubProcess(elementId, nestedSubProcess)) {
          return true;
        }
      }
    }
    return false;
  };

/**
 * Saves task metadata to BPMN XML using camunda:properties extension
 * @param {string} bpmnXml - The original BPMN XML string
 * @param {string} taskId - The ID of the task to update
 * @param {Object} taskData - The task configuration data to save
 * @returns {Promise<string>} - The updated BPMN XML string
 */
export const saveTaskMetadata = async (bpmnXml, taskId, taskData) => {
  try {
    // Create a BPMN moddle instance
    const moddle = new BpmnModdle({
      camunda: require('camunda-bpmn-moddle/resources/camunda')
    });

    // Parse the BPMN XML
    const { rootElement } = await moddle.fromXML(bpmnXml);

    // Find the task element by ID
    const taskElement = findElementById(rootElement, taskId);
    if (!taskElement) {
      throw new Error(`Task with ID ${taskId} not found in BPMN XML`);
    }

    // Create or get existing extensionElements
    let extensionElements = taskElement.extensionElements;
    if (!extensionElements) {
      extensionElements = moddle.create('bpmn:ExtensionElements');
      taskElement.extensionElements = extensionElements;
    }

    // Create or get existing camunda:properties
    let propertiesElement = extensionElements.get('values').find(v => v.$type === 'camunda:Properties');
    if (!propertiesElement) {
      propertiesElement = moddle.create('camunda:Properties');
      extensionElements.get('values').push(propertiesElement);
    }

    // Clear existing properties
    propertiesElement.values = [];

    // Add task configuration as properties
    Object.entries(taskData).forEach(([key, value]) => {
      // Skip complex objects - serialize them separately
      if (key === 'customFields' && Array.isArray(value)) {
        const propertyValue = moddle.create('camunda:Property', {
          name: key,
          value: JSON.stringify(value)
        });
        propertiesElement.values.push(propertyValue);
      } else if (typeof value !== 'object') {
        const propertyValue = moddle.create('camunda:Property', {
          name: key,
          value: String(value)
        });
        propertiesElement.values.push(propertyValue);
      }
    });

    // Convert back to XML
    const { xml } = await moddle.toXML(rootElement);
    return xml;
  } catch (error) {
    console.error('Error saving task metadata:', error);
    throw error;
  }
};

/**
 * Recursively finds an element by ID in the BPMN model
 * @param {Object} element - The BPMN element to search in
 * @param {string} id - The ID to search for
 * @returns {Object|null} - The found element or null
 */
const findElementById = (element, id) => {
  if (element.id === id) {
    return element;
  }

  // Search in flowElements (tasks, gateways, etc.)
  if (element.flowElements) {
    for (const flowElement of element.flowElements) {
      const found = findElementById(flowElement, id);
      if (found) return found;
    }
  }

  // Search in childLaneSet
  if (element.childLaneSet && element.childLaneSet.lanes) {
    for (const lane of element.childLaneSet.lanes) {
      const found = findElementById(lane, id);
      if (found) return found;
    }
  }

  // Search in participants
  if (element.participants) {
    for (const participant of element.participants) {
      const found = findElementById(participant, id);
      if (found) return found;
    }
  }

  // Search in processRef of participants
  if (element.processRef) {
    const found = findElementById(element.processRef, id);
    if (found) return found;
  }

  return null;
};
  
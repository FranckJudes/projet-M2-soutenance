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
  
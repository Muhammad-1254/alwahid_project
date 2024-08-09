
import { Alert } from 'react-native';

class ErrorHandler {
  static handle(error:any,customData?:{alertTitle:string,customMessage:string},) {
    let errorMessage = 'Something went wrong!';
    if(customData){
    Alert.alert(customData.alertTitle, customData.customMessage); 
    return
    }else if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          errorMessage = 'Bad Request';
          break;
        case 401:
          errorMessage = 'Unauthorized';
          break;
        case 403:
          errorMessage = 'Forbidden';
          break;
        case 404:
          errorMessage = 'Not Found';
          break;
        case 409:
          errorMessage = 'Duplicate entry detected';
          break;
        case 500:
          errorMessage = 'Internal Server Error';
          break;
        default:
          errorMessage = 'An unexpected error occurred';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    Alert.alert("Error", errorMessage);
  }
}

export default ErrorHandler;

export const globalErrorHandler = (error:any, isFatal:any) => {
    ErrorHandler.handle(error);
    if (isFatal) {
        Alert.alert('Fatal Error', 'An unexpected error occurred.');
    }
}
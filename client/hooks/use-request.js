import axios from 'axios';
import { useState } from 'react';

const useRequest = ({ url, method, body, onSuccess }) => {
  const [errs, setErrs] = useState(null);

  const doRequest = async () => {
    try {
      setErrs(null);
      const response = await axios[method](url, body);
      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (err) {
      console.log(err);
      setErrs(
        <div className='alert alert-danger'>
          <h4>Oops...</h4>
          <ul>
            {err.response.data.errors.map(e => (
              <li key={e.message}>{e.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errs };
};

export default useRequest;

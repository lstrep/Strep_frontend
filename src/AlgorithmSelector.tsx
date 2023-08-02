import React from 'react';
import { Algorithm } from './App';
import { KrigingOption } from './App';
import { IDWOption } from './App';

interface AlgorithmSelectorProps {
  selectedAlgorithm: Algorithm;
  handleAlgorithmChange: (algorithm: Algorithm) => void;
  selectedKrigingOption: KrigingOption;
  handleKrigingOptionChange: (option: KrigingOption) => void;
  selectedIDWOption: IDWOption;
  handleIDWOptionChange: (option: IDWOption) => void;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  selectedAlgorithm,
  handleAlgorithmChange,
  selectedKrigingOption,
  handleKrigingOptionChange,
  selectedIDWOption,
  handleIDWOptionChange
}) => {
  const algorithmOptions = Object.values(Algorithm);
  const krigingOptions = Object.values(KrigingOption);
  const idwOptions = Object.values(IDWOption);

  return (
    <div className="algorithmSelector">
      <select
        value={selectedAlgorithm}
        onChange={(e) => handleAlgorithmChange(e.target.value as Algorithm)}
      >
        <option value="">--Select an algorithm--</option>
        {algorithmOptions.map((algorithm) => (
          <option key={algorithm} value={algorithm} selected={algorithm === Algorithm.KRIGING}>
            {algorithm}
          </option>
        ))}
      </select>


      {selectedAlgorithm === Algorithm.KRIGING && (
        <div className="krigingOptionsSelector">
          <select
            value={selectedKrigingOption}
            onChange={(e) =>
              handleKrigingOptionChange(e.target.value as KrigingOption)
            }
          >
            <option value="">--Select an option--</option>
            {krigingOptions.map((option) => (
              <option key={option} value={option} selected={option === KrigingOption.Exponential}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}


            {selectedAlgorithm === Algorithm.IDW && (
        <div className="idwOptionsSelector">
          <select
            value={selectedIDWOption}
            onChange={(e) =>
              handleIDWOptionChange(e.target.value as IDWOption)
            }
          >
            <option value="">--Select an option--</option>
            {idwOptions.map((option) => (
              <option key={option} value={option} selected={option === IDWOption.Single}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default AlgorithmSelector;
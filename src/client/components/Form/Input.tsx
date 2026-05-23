import { type InputHTMLAttributes } from 'react';
import styled from '@emotion/styled';
import colors from 'client/styles/colors';
import { type InputSize, applySize } from 'client/styles/dimensions';

type Orientation = 'horizontal' | 'vertical';

interface Props {
  id: string;
  value: string;
  name?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: InputSize;
  orientation?: Orientation;
  handleChange: (nweVal: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown?: (keyEvent: React.KeyboardEvent<HTMLInputElement>) => void;
}

type SupportedElements = HTMLInputElement | HTMLLabelElement | HTMLDivElement;
interface StyledInputTypes extends InputHTMLAttributes<SupportedElements> {
  inputSize?: InputSize;
  orientation?: Orientation;
}

const InputContainer = styled.div<StyledInputTypes>`
  display: flex;
  gap: 0.5rem;
  ${(props) => (props.orientation === 'vertical' ? 'flex-direction: column;' : '')};
`;

const StyledInput = styled.input<StyledInputTypes>`
  background: color-mix(in srgb, ${colors.surfaceAccent} 76%, ${colors.background});
  color: ${colors.textColor};
  border: 1px solid ${colors.borderSubtle};
  border-radius: 16px;
  font-family: var(--font-mono);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, ${colors.textColor} 8%, transparent),
    0 12px 30px color-mix(in srgb, ${colors.bgShadowColor} 18%, transparent);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
  &:focus {
    outline: none;
    border-color: ${colors.borderStrong};
    box-shadow:
      0 0 0 4px color-mix(in srgb, ${colors.primaryTransparent} 75%, transparent),
      0 18px 36px color-mix(in srgb, ${colors.bgShadowColor} 18%, transparent);
  }
  &::placeholder {
    color: ${colors.textColorThirdly};
  }

  ${(props) => applySize(props.inputSize)};
`;

const StyledLabel = styled.label<StyledInputTypes>`
  color: ${colors.textColorSecondary};
  ${(props) => applySize(props.inputSize)};
  padding: 0;
  font-size: 0.82rem;
  font-family: var(--font-mono);
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1.4;
  text-transform: uppercase;
`;

const Input = (inputProps: Props): JSX.Element => {
  const {
    id,
    value,
    label,
    placeholder,
    name,
    disabled,
    size,
    orientation,
    handleChange,
    handleKeyDown,
  } = inputProps;

  return (
    <InputContainer orientation={orientation}>
      {label && (
        <StyledLabel htmlFor={id} inputSize={size}>
          {label}
        </StyledLabel>
      )}
      <StyledInput
        id={id}
        value={value}
        placeholder={placeholder}
        name={name}
        disabled={disabled}
        onChange={handleChange}
        inputSize={size}
        onKeyDown={handleKeyDown || (() => {})}
      />
    </InputContainer>
  );
};

export default Input;

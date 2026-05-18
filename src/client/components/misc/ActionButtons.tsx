import styled from '@emotion/styled';
import Button from 'client/components/Form/Button';
import colors from 'client/styles/colors';

const ActionButtonContainer = styled.div`
  opacity: 0.75;
  display: flex;
  gap: 0.25rem;
  align-items: center;
  flex-shrink: 0;
`;

interface Action {
  label: string;
  icon: string;
  onClick: () => void;
}

const actionButtonStyles = `
  padding: 0 0.25rem;
  font-size: 1.25rem;
  text-align: center;
  width: 1.5rem;
  height: 1.5rem;
  color: ${colors.textColor};
  background: ${colors.background};
  box-shadow: none;
  border-radius: 999px;
  border: 1px solid ${colors.primaryTransparent};
  transition: all 0.2s ease-in-out;
  margin: 0;
  display: flex;
  align-items: center;
  &:hover {
    color: ${colors.primary};
    background: ${colors.backgroundDarker};
    box-shadow: none;
  }
`;

const ActionButtons = (props: { actions: any }): JSX.Element => {
  const actions = props.actions;
  if (!actions) return <></>;
  return (
    <ActionButtonContainer>
      {actions.map((action: Action, index: number) => (
        <Button
          key={`action-${index}`}
          styles={actionButtonStyles}
          onClick={action.onClick}
          title={action.label}
        >
          {action.icon}
        </Button>
      ))}
    </ActionButtonContainer>
  );
};

export default ActionButtons;

import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import React, { useCallback, useMemo } from 'react';
import Icon from 'react-native-vector-icons/Feather';

import {
  Container,
  Title,
  Description,
  OKButton,
  OKButtonText,
} from './styles';

interface RoutesParams {
  date: number;
}

const AppointmentCreated: React.FC = () => {
  const { reset } = useNavigation();

  const { params } = useRoute();

  const routePrams = params as RoutesParams;

  const handleOkPressed = useCallback(() => {
    reset({
      routes: [
        {
          name: 'Dashboard',
        },
      ],
      index: 0,
    });
  }, [reset]);

  const formattedDate = useMemo(() => {
    return format(
      routePrams.date,
      "EEEE', dia' dd 'de' MMMM 'de' yyyy 'as' HH:mm'h'",
      { locale: ptBR },
    );
  }, [routePrams.date]);

  return (
    <Container>
      <Icon name="check" size={80} color="#04d361" />

      <Title>Agendamento concluido</Title>
      <Description>{formattedDate}</Description>

      <OKButton onPress={handleOkPressed}>
        <OKButtonText>Ok</OKButtonText>
      </OKButton>
    </Container>
  );
};

export default AppointmentCreated;

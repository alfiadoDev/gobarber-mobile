import React, { useRef, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  View,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';
import ImagePicker from 'react-native-image-picker';

import getValidationsErrors from '../../utils/getValidationserrors';
import api from '../../services/api';

import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  Container,
  Title,
  BackButton,
  UserAvatarButton,
  UserAvatar,
} from './styles';
import { useAuth } from '../../hooks/auth';

interface ProfileFormData {
  name: string;
  email: string;
  password: string;
  old_password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();

  const formRef = useRef<FormHandles>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const old_passwordInputRef = useRef<TextInput>(null);
  const passwordConfirmationInputRef = useRef<TextInput>(null);

  const handleSubmit = useCallback(
    async (data: ProfileFormData) => {
      formRef.current?.setErrors({});

      try {
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um E-mail valido'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: value => !!value.length,
            then: Yup.string()
              .required('Campo Obrigatorio')
              .min(6, 'No minimo 6 digitos'),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when('old_password', {
              is: value => !!value.length,
              then: Yup.string().required('Campo Obrigatorio'),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref('password')], 'Confirmacao incorecta'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const formData = {
          name: data.name,
          email: data.email,
          ...(data.old_password
            ? {
                old_password: data.old_password,
                password: data.password,
                password_confirmation: data.password_confirmation,
              }
            : {}),
        };

        const response = await api.put('profile', formData);

        updateUser(response.data);

        Alert.alert('Perfil atualizado com sucesso');

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationsErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }
        Alert.alert(
          'Erro na atualizacao do perfil',
          'ocorreu um erro ao atualizar perfil tente novamente',
        );
      }
    },
    [navigation, updateUser],
  );

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleUpdateAvatar = useCallback(() => {
    ImagePicker.showImagePicker(
      {
        title: 'Selecione um avatar',
        cancelButtonTitle: 'Cancelar',
        takePhotoButtonTitle: 'Usar camera',
        chooseFromLibraryButtonTitle: 'Escolher da galeria',
      },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.error) {
          Alert.alert('Erro ao atualizar seu avatar');
          return;
        }
        const data = new FormData();

        data.append('avatar', {
          type: 'image/jpeg',
          name: `${user.id}.jpg`,
          uri: response.uri,
        });

        api.patch('users/avatar', data).then(apiResponse => {
          updateUser(apiResponse.data);
        });
      },
    );
  }, [updateUser, user.id]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <ScrollView>
            <Container>
              <BackButton onPress={handleGoBack}>
                <Icon name="chevron-left" size={24} color="#999591" />
              </BackButton>

              <UserAvatarButton onPress={handleUpdateAvatar}>
                <UserAvatar source={{ uri: user.avatar_url }} />
              </UserAvatarButton>

              <View>
                <Title>Meu Perfil</Title>
              </View>

              <Form
                initialData={{
                  name: user.name,
                  email: user.email,
                }}
                style={{ width: '100%' }}
                ref={formRef}
                onSubmit={handleSubmit}
              >
                <Input
                  name="name"
                  icon="user"
                  placeholder="Nome"
                  autoCorrect={false}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    emailInputRef.current?.focus();
                  }}
                />
                <Input
                  name="email"
                  icon="mail"
                  placeholder="E-mail"
                  keyboardType="email-address"
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="next"
                  ref={emailInputRef}
                  onSubmitEditing={() => {
                    old_passwordInputRef.current?.focus();
                  }}
                />
                <Input
                  ref={old_passwordInputRef}
                  name="old_password"
                  icon="lock"
                  placeholder="Senha atual"
                  secureTextEntry
                  textContentType="newPassword"
                  containerStyle={{ marginTop: 16 }}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    passwordInputRef.current?.focus();
                  }}
                />

                <Input
                  ref={passwordInputRef}
                  name="password"
                  icon="lock"
                  placeholder="Nova senha"
                  secureTextEntry
                  textContentType="newPassword"
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    passwordConfirmationInputRef.current?.focus();
                  }}
                />

                <Input
                  ref={passwordConfirmationInputRef}
                  name="password_confirmation"
                  icon="lock"
                  placeholder="Confirmar senha"
                  secureTextEntry
                  textContentType="newPassword"
                  returnKeyType="send"
                  onSubmitEditing={() => {
                    formRef.current?.submitForm();
                  }}
                />

                <Button
                  onPress={() => {
                    formRef.current?.submitForm();
                  }}
                >
                  Confirmar mudancas
                </Button>
              </Form>
            </Container>
          </ScrollView>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;

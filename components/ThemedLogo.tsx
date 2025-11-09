import {
  useColorScheme,
  Image,
  ImageProps,
  ImageSourcePropType,
  StyleProp,
  ImageStyle,
} from "react-native";
import Logo from "../assets/img/appopintdi_logo.png";

type ThemedLogoProps = Omit<ImageProps, "source"> & {
  style?: StyleProp<ImageStyle>;
};

const ThemedLogo: React.FC<ThemedLogoProps> = ({ style, ...props }) => {
  const colorScheme = useColorScheme();

  const logo: ImageSourcePropType = Logo;
  return <Image source={logo} style={style} {...props} />;
};

export default ThemedLogo;

import React from 'react';
import {Dimensions, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../lib/colors';

const Profile = props => {
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "flex-end",
				paddingBottom: 80,
				alignItems: "center",
				backgroundColor: colors.white,
				width: Dimensions.get("screen").width
			}}>
			<TouchableOpacity onPress={props.handleLogout}>
				<Text
					style={{
						textTransform: "uppercase",
						textDecorationLine: "underline"
					}}>
					Se déconnecter
				</Text>
			</TouchableOpacity>
		</View>
	);
};

export default Profile;

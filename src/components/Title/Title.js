import React, {Component} from "react";
import styled from 'styled-components';

const Text = styled.span`
font-size:48px;
margin: 3px 12px
color: #3366CC;
@media screen and (max-width: 1024px) {
	font-size: 30px;
}
`

class Title extends Component {
	render() {
		return <Text>
			{this.props.text}
		</Text>;
	}
}

export default Title;

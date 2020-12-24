import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {switchState} from '../../actions';
import {connect} from 'react-redux'


const Icon = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 32px;
    width: 100%;
    color: ${props => props.isActive ? "#019A99" : (props => props.isUnlock ? "#3366CC" : "#C3C3C3")};
    &:hover{
        cursor:${props => props.isUnlock ? "pointer" : "default"};
    }
`;

const Title = styled.div`
    font-size: 14px;
    margin-top: 8px;
    font-weight: bolder;
    font-family: Myriad Pro condensend
`

const Stage = ({dispatch, active, unlock, icon, text, index}) => {
	return (
		<Icon onClick={e => {
			if (!unlock) {
				return;
			}
			dispatch(switchState(index))
		}}
		      isActive={(active)}
		      isUnlock={(unlock)}>
			
			<FontAwesomeIcon icon={icon}/>
			<Title>{text}</Title>
		</Icon>
	)
}

Stage.propTypes = {
	active: PropTypes.bool.isRequired,
	index: PropTypes.number.isRequired,
	unlock: PropTypes.bool.isRequired,
	icon: PropTypes.string.isRequired,
	text: PropTypes.string.isRequired
}

export default connect()(Stage);

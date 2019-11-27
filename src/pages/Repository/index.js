import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Lottie from 'react-lottie';
import animationData from '../../animations/loading2.json';
import animationDataDots from '../../animations/loadingdots.json';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    isStopped: false,
    isPaused: false,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 10,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false, // false
    });
  }

  render() {
    const { repository, issues, loading } = this.state;

    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
      },
    };

    const defaultOptionsDots = {
      loop: true,
      autoplay: true,
      animationData: animationDataDots,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
      },
    };

    if (loading) {
      return (
        <Loading>
          <Lottie
            options={defaultOptions}
            height={50}
            width={50}
            isStopped={this.state.isStopped}
            isPaused={this.state.isPaused}
          />
          <div>
            Carregando
            <div>
              <Lottie
                options={defaultOptionsDots}
                height={25}
                width={25}
                isStopped={this.state.isStopped}
                isPaused={this.state.isPaused}
              />
            </div>
          </div>
        </Loading>
      );
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
